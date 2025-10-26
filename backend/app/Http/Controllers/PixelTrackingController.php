<?php

namespace App\Http\Controllers;

use App\Services\PixelTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

/**
 * Handles incoming tracking requests and analytics reporting.
 */
class PixelTrackingController extends Controller
{
    protected $trackingService;

    public function __construct(PixelTrackingService $trackingService)
    {
        $this->trackingService = $trackingService;
    }

    /**
     * Receives and tracks an event from the client-side pixel.
     * This endpoint should be non-blocking and return quickly.
     * * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function track(Request $request)
    {
        // Define strict validation rules for the incoming payload
        $validator = Validator::make($request->all(), [
            'pixel_id' => 'required|string|max:50',
            'session_id' => 'required|string|max:50',
            'event_type' => 'required|string|max:100',
            'user_id' => 'nullable|integer',
            // Arrays are validated generally, specific validation happens in service/logic if needed
            'event_data' => 'nullable|array',
            'browser_info' => 'nullable|array',
            'referrer_info' => 'nullable|array',
            'timestamp' => 'required|date' // Client-side ISO timestamp
        ]);

        if ($validator->fails()) {
            // Log validation failure but return a soft error (e.g., 400) or 202 
            // depending on how strictly you want to handle malformed beacons. 
            // For a production pixel, logging and 202 is often preferred.
            Log::warning('Pixel Tracking Validation Failed', [
                'errors' => $validator->errors()->toArray(),
                'request' => $request->all()
            ]);
            
            // Return 400 Bad Request to indicate client error, but keep response body minimal.
            return response()->json(['success' => false, 'message' => 'Invalid data format.'], 400);
        }

        try {
            $event = $this->trackingService->trackEvent($request->all());

            // Use 202 Accepted status for non-blocking requests like tracking pixels
            return response()->json([
                'success' => true,
                'message' => 'Event accepted for processing.',
                'event_id' => $event->id ?? null,
                'data' => $event
            ], 202);
        } catch (\Exception $e) {
            // Log severe errors for server review
            Log::error('Pixel Tracking Server Error: ' . $e->getMessage(), ['request' => $request->all()]);
            
            // Return 202 or 500. 202 is less likely to trigger client retry/error states.
            return response()->json([
                'success' => false,
                'message' => 'Server failed to process event.',
                'error_detail' => config('app.debug') ? $e->getMessage() : null // Only show detail in debug mode
            ], 202); 
        }
    }
    
    /**
     * Fetches aggregated analytics data for a specific pixel.
     * Requires authentication (e.g., Sanctum token, API key) for access.
     * * @param string $pixelId The unique pixel_id string.
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAnalytics(string $pixelId, Request $request)
    {
        // NOTE: Add Auth Middleware to this route (e.g., 'auth:sanctum')
        // to ensure only the owner can view analytics.
        
        $filters = $request->only(['start_date', 'end_date', 'event_type', 'user_id']);
        
        try {
            $analytics = $this->trackingService->getAnalytics($pixelId, $filters);
            
            return response()->json([
                'success' => true,
                'data' => $analytics
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Pixel not found or inactive.'], 404);
        } catch (\Exception $e) {
            Log::error('Analytics retrieval error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'An error occurred while fetching analytics.'], 500);
        }
    }
}
