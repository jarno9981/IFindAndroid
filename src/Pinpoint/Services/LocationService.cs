using Pinpoint.Models;

namespace Pinpoint.Services;

public class LocationService : ILocationService
{
    public event EventHandler<LocationUpdate>? LocationChanged;

    public async Task<bool> RequestPermissionsAsync()
    {
        var status = await Permissions.CheckStatusAsync<Permissions.LocationWhenInUse>();
        if (status != PermissionStatus.Granted)
            status = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();
        if (status != PermissionStatus.Granted) return false;

        var always = await Permissions.CheckStatusAsync<Permissions.LocationAlways>();
        if (always != PermissionStatus.Granted)
            await Permissions.RequestAsync<Permissions.LocationAlways>();
        return true;
    }

    public async Task<LocationUpdate?> GetCurrentAsync(CancellationToken ct = default)
    {
        try
        {
            var req = new GeolocationRequest(GeolocationAccuracy.Best, TimeSpan.FromSeconds(10));
            var loc = await Geolocation.Default.GetLocationAsync(req, ct);
            if (loc is null) return null;
            var up = new LocationUpdate(loc.Latitude, loc.Longitude, loc.Accuracy, loc.Timestamp.UtcDateTime);
            LocationChanged?.Invoke(this, up);
            return up;
        }
        catch
        {
            return null;
        }
    }

    public void Publish(LocationUpdate u) => LocationChanged?.Invoke(this, u);
}
