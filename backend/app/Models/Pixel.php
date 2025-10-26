<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pixel extends Model
{
    protected $fillable = [
        'pixel_id',
        'name',
        'user_id',
        'is_active',
        'settings'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($pixel) {
            if (empty($pixel->pixel_id)) {
                $pixel->pixel_id = 'px_' . Str::random(16);
            }
        });
    }

    public function trackingEvents()
    {
        return $this->hasMany(TrackingEvent::class);
    }

    public function sessions()
    {
        return $this->hasMany(TrackingSession::class);
    }

    public function conversions()
    {
        return $this->hasMany(Conversion::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}