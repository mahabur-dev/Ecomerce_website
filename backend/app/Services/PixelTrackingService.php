<?php

namespace App\Services;

use App\Models\Pixel;
use App\Models\TrackingEvent;
use App\Models\TrackingSession;
use App\Models\Conversion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PixelTrackingService
{
    /**
     * Track an event
     */
    public function trackEvent(array $data)
    {
        return $data;
        // Validate pixel exists and is active
        $pixel = Pixel::where('pixel_id', $data['pixel_id'])
            ->where('is_active', true)
            ->first();
 
        if (!$pixel) {
            return false;
        }

        // Create tracking event
        $event = TrackingEvent::create([
            'pixel_id' => $pixel->id,
            'session_id' => $data['session_id'],
            'user_id' => $data['user_id'] ?? null,
            'event_type' => $data['event_type'],
            'event_data' => $data['event_data'] ?? [],
            'browser_info' => $data['browser_info'] ?? [],
            'referrer_info' => $data['referrer_info'] ?? [],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'event_timestamp' => $data['timestamp'] ?? now()
        ]);

        // Update or create session
        $this->updateSession($pixel, $data);

        // Track conversions
        if (in_array($data['event_type'], ['purchase', 'signup', 'lead'])) {
            $this->trackConversion($pixel, $data);
        }

        return $event;
    }

    /**
     * Update session data
     */
    protected function updateSession(Pixel $pixel, array $data)
    {
        $session = TrackingSession::firstOrNew([
            'pixel_id' => $pixel->id,
            'session_id' => $data['session_id']
        ]);

        if (!$session->exists) {
            $session->fill([
                'user_id' => $data['user_id'] ?? null,
                'first_seen_at' => now(),
                'landing_page' => $data['referrer_info']['currentUrl'] ?? null,
                'referrer' => $data['referrer_info']['referrer'] ?? 'direct'
            ]);
        }

        $session->last_seen_at = now();
        $session->events_count++;

        if ($data['event_type'] === 'page_view') {
            $session->page_views++;
        }

        if ($data['event_type'] === 'page_exit') {
            $session->exit_page = $data['referrer_info']['currentUrl'] ?? null;
            $session->duration_seconds = $data['event_data']['duration'] ?? 0;
        }

        $session->save();

        return $session;
    }

    /**
     * Track conversion
     */
    protected function trackConversion(Pixel $pixel, array $data)
    {
        $conversionData = $data['event_data'] ?? [];

        return Conversion::create([
            'pixel_id' => $pixel->id,
            'session_id' => $data['session_id'],
            'user_id' => $data['user_id'] ?? null,
            'conversion_type' => $data['event_type'],
            'value' => $conversionData['total'] ?? $conversionData['value'] ?? null,
            'currency' => $conversionData['currency'] ?? 'USD',
            'conversion_data' => $conversionData
        ]);
    }

    /**
     * Get analytics for a pixel
     */
    public function getAnalytics(string $pixelId, array $filters = [])
    {
        $pixel = Pixel::where('pixel_id', $pixelId)->firstOrFail();

        $startDate = $filters['start_date'] ?? Carbon::now()->subDays(30);
        $endDate = $filters['end_date'] ?? Carbon::now();

        return [
            'total_events' => $this->getTotalEvents($pixel->id, $startDate, $endDate),
            'unique_visitors' => $this->getUniqueVisitors($pixel->id, $startDate, $endDate),
            'page_views' => $this->getPageViews($pixel->id, $startDate, $endDate),
            'conversions' => $this->getConversions($pixel->id, $startDate, $endDate),
            'conversion_rate' => $this->getConversionRate($pixel->id, $startDate, $endDate),
            'top_pages' => $this->getTopPages($pixel->id, $startDate, $endDate),
            'traffic_sources' => $this->getTrafficSources($pixel->id, $startDate, $endDate),
            'events_by_type' => $this->getEventsByType($pixel->id, $startDate, $endDate),
        ];
    }

    protected function getTotalEvents($pixelId, $startDate, $endDate)
    {
        return TrackingEvent::where('pixel_id', $pixelId)
            ->whereBetween('event_timestamp', [$startDate, $endDate])
            ->count();
    }

    protected function getUniqueVisitors($pixelId, $startDate, $endDate)
    {
        return TrackingSession::where('pixel_id', $pixelId)
            ->whereBetween('first_seen_at', [$startDate, $endDate])
            ->distinct('session_id')
            ->count();
    }

    protected function getPageViews($pixelId, $startDate, $endDate)
    {
        return TrackingEvent::where('pixel_id', $pixelId)
            ->where('event_type', 'page_view')
            ->whereBetween('event_timestamp', [$startDate, $endDate])
            ->count();
    }

    protected function getConversions($pixelId, $startDate, $endDate)
    {
        return Conversion::where('pixel_id', $pixelId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
    }

    protected function getConversionRate($pixelId, $startDate, $endDate)
    {
        $visitors = $this->getUniqueVisitors($pixelId, $startDate, $endDate);
        $conversions = $this->getConversions($pixelId, $startDate, $endDate);

        return $visitors > 0 ? round(($conversions / $visitors) * 100, 2) : 0;
    }

    protected function getTopPages($pixelId, $startDate, $endDate)
    {
        return TrackingEvent::where('pixel_id', $pixelId)
            ->where('event_type', 'page_view')
            ->whereBetween('event_timestamp', [$startDate, $endDate])
            ->select('event_data->page as page', DB::raw('count(*) as views'))
            ->groupBy('page')
            ->orderByDesc('views')
            ->limit(10)
            ->get();
    }

    protected function getTrafficSources($pixelId, $startDate, $endDate)
    {
        return TrackingSession::where('pixel_id', $pixelId)
            ->whereBetween('first_seen_at', [$startDate, $endDate])
            ->select('referrer', DB::raw('count(*) as count'))
            ->groupBy('referrer')
            ->orderByDesc('count')
            ->get();
    }

    protected function getEventsByType($pixelId, $startDate, $endDate)
    {
        return TrackingEvent::where('pixel_id', $pixelId)
            ->whereBetween('event_timestamp', [$startDate, $endDate])
            ->select('event_type', DB::raw('count(*) as count'))
            ->groupBy('event_type')
            ->orderByDesc('count')
            ->get();
    }
}