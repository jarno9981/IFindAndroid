using Android.App;
using Android.Content;
using Android.Content.PM;
using Android.Locations;
using Android.OS;
using AndroidX.Core.App;
using Pinpoint.Services;
using AndroidApp = Android.App.Application;
using AndroidLocation = Android.Locations.Location;
using LocationUpdate = Pinpoint.Models.LocationUpdate;

namespace Pinpoint.Platforms.Droid;

[Service(Exported = false, ForegroundServiceType = ForegroundService.TypeLocation)]
public class LocationForegroundService : Service, ILocationListener
{
    const string ChannelId = "pinpoint.location";
    const int NotifId = 4711;
    LocationManager? _lm;

    public override IBinder? OnBind(Intent? intent) => null;

    public override void OnCreate()
    {
        base.OnCreate();
        EnsureChannel();
        if (Build.VERSION.SdkInt >= BuildVersionCodes.Q)
            StartForeground(NotifId, BuildNotification(), ForegroundService.TypeLocation);
        else
            StartForeground(NotifId, BuildNotification());

        _lm = (LocationManager?)GetSystemService(LocationService);
        try
        {
            _lm?.RequestLocationUpdates(LocationManager.GpsProvider, 10_000, 10f, this);
            _lm?.RequestLocationUpdates(LocationManager.NetworkProvider, 15_000, 25f, this);
        }
        catch { /* permission may be missing */ }
    }

    public override StartCommandResult OnStartCommand(Intent? intent, StartCommandFlags flags, int startId)
        => StartCommandResult.Sticky;

    public override void OnDestroy()
    {
        try { _lm?.RemoveUpdates(this); } catch { }
        base.OnDestroy();
    }

    void EnsureChannel()
    {
        if (Build.VERSION.SdkInt < BuildVersionCodes.O) return;
        var nm = (NotificationManager?)GetSystemService(NotificationService);
        if (nm?.GetNotificationChannel(ChannelId) is null)
        {
            var ch = new NotificationChannel(ChannelId, "Live location", NotificationImportance.Low)
            { Description = "Pinpoint is sharing your live location." };
            nm?.CreateNotificationChannel(ch);
        }
    }

    Notification BuildNotification()
    {
        var b = new NotificationCompat.Builder(this, ChannelId)
            .SetContentTitle("Pinpoint")
            .SetContentText("Sharing your live location")
            .SetSmallIcon(Android.Resource.Drawable.SymDefAppIcon)
            .SetOngoing(true);
        return b.Build();
    }

    public void OnLocationChanged(AndroidLocation location)
    {
        var u = new LocationUpdate(location.Latitude, location.Longitude,
            location.HasAccuracy ? location.Accuracy : (double?)null,
            DateTimeOffset.FromUnixTimeMilliseconds(location.Time).UtcDateTime);

        var sharing = IPlatformApplication.Current?.Services.GetService<ISharingService>();
        sharing?.PushLocation(u);
    }

    public void OnProviderEnabled(string provider) { }
    public void OnProviderDisabled(string provider) { }
    public void OnStatusChanged(string? provider, Availability status, Bundle? extras) { }
}
