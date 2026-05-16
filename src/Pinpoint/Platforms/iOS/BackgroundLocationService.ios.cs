using CoreLocation;
using Foundation;
using Pinpoint.Models;

namespace Pinpoint.Services;

public partial class BackgroundLocationService
{
    CLLocationManager? _lm;

    public partial Task StartAsync()
    {
        if (IsRunning) return Task.CompletedTask;

        _lm = new CLLocationManager
        {
            DesiredAccuracy = CLLocation.AccuracyBest,
            DistanceFilter = 10,
            AllowsBackgroundLocationUpdates = true,
            PausesLocationUpdatesAutomatically = false,
            ShowsBackgroundLocationIndicator = true,
        };
        _lm.RequestAlwaysAuthorization();
        _lm.LocationsUpdated += OnLocationsUpdated;
        _lm.StartUpdatingLocation();
        _lm.StartMonitoringSignificantLocationChanges();

        IsRunning = true;
        return Task.CompletedTask;
    }

    public partial Task StopAsync()
    {
        if (!IsRunning || _lm is null) return Task.CompletedTask;
        _lm.StopUpdatingLocation();
        _lm.StopMonitoringSignificantLocationChanges();
        _lm.LocationsUpdated -= OnLocationsUpdated;
        _lm.Dispose();
        _lm = null;
        IsRunning = false;
        return Task.CompletedTask;
    }

    void OnLocationsUpdated(object? sender, CLLocationsUpdatedEventArgs e)
    {
        var l = e.Locations.LastOrDefault();
        if (l is null) return;
        var u = new LocationUpdate(l.Coordinate.Latitude, l.Coordinate.Longitude,
            l.HorizontalAccuracy, (DateTime)l.Timestamp);
        var sharing = IPlatformApplication.Current?.Services.GetService<ISharingService>();
        sharing?.PushLocation(u);
    }
}
