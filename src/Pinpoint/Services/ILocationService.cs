using Pinpoint.Models;

namespace Pinpoint.Services;

public interface ILocationService
{
    event EventHandler<LocationUpdate>? LocationChanged;
    Task<LocationUpdate?> GetCurrentAsync(CancellationToken ct = default);
    Task<bool> RequestPermissionsAsync();
}

public interface IBackgroundLocationService
{
    bool IsRunning { get; }
    Task StartAsync();
    Task StopAsync();
}

public interface ISharingService
{
    IReadOnlyList<Person> People { get; }
    IReadOnlyList<TrackedDevice> Devices { get; }
    IReadOnlyList<AlertItem> Alerts { get; }
    bool IsSharing { get; }
    event EventHandler? Changed;
    Task ToggleSharingAsync(bool on);
    void PushLocation(LocationUpdate update);
    void MarkAlertRead(string id);
}
