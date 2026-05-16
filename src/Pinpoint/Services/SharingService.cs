using Pinpoint.Models;

namespace Pinpoint.Services;

public class SharingService : ISharingService
{
    private readonly List<Person> _people = new();
    private readonly List<TrackedDevice> _devices = new();
    private readonly List<AlertItem> _alerts = new();

    public IReadOnlyList<Person> People => _people;
    public IReadOnlyList<TrackedDevice> Devices => _devices;
    public IReadOnlyList<AlertItem> Alerts => _alerts;
    public bool IsSharing { get; private set; } = true;

    public event EventHandler? Changed;

    public SharingService()
    {
        _people.AddRange(new[]
        {
            new Person { Name = "You",   Initials = "YO", Accent = "#7CC4FF", Latitude = 37.7749, Longitude = -122.4194, Status = "Sharing live" },
            new Person { Name = "Maya",  Initials = "MA", Accent = "#B8A4FF", Latitude = 37.7790, Longitude = -122.4130, Status = "At Mission Dolores" },
            new Person { Name = "Leo",   Initials = "LE", Accent = "#FFB787", Latitude = 37.7649, Longitude = -122.4294, Status = "On the move" },
            new Person { Name = "Ava",   Initials = "AV", Accent = "#87E0A9", Latitude = 37.7820, Longitude = -122.4080, Status = "Home" },
        });

        _devices.AddRange(new[]
        {
            new TrackedDevice{ Name = "Jarno's iPhone", Kind = DeviceKind.Phone,   Latitude = 37.7749, Longitude = -122.4194, Battery = 78, Online = true,  Owner = "You" },
            new TrackedDevice{ Name = "AirTag - Keys",  Kind = DeviceKind.Tag,     Latitude = 37.7755, Longitude = -122.4170, Battery = 92, Online = true,  Owner = "You" },
            new TrackedDevice{ Name = "MacBook Pro",    Kind = DeviceKind.Laptop,  Latitude = 37.7741, Longitude = -122.4201, Battery = 45, Online = true,  Owner = "You" },
            new TrackedDevice{ Name = "Pixel Buds",     Kind = DeviceKind.Earbuds, Latitude = 37.7720, Longitude = -122.4220, Battery = 12, Online = false, Owner = "You" },
        });

        _alerts.AddRange(new[]
        {
            new AlertItem{ Title = "Maya arrived Home", Subtitle = "2 minutes ago", When = DateTime.UtcNow.AddMinutes(-2), Icon = "home" },
            new AlertItem{ Title = "Pixel Buds offline", Subtitle = "Last seen 18 min ago", When = DateTime.UtcNow.AddMinutes(-18), Icon = "alert", Read = false },
            new AlertItem{ Title = "Leo left Office", Subtitle = "32 minutes ago", When = DateTime.UtcNow.AddMinutes(-32), Icon = "walk", Read = true },
        });
    }

    public Task ToggleSharingAsync(bool on)
    {
        IsSharing = on;
        var you = _people.FirstOrDefault(p => p.Name == "You");
        if (you is not null)
        {
            you.Sharing = on;
            you.Status = on ? "Sharing live" : "Paused";
        }
        Changed?.Invoke(this, EventArgs.Empty);
        return Task.CompletedTask;
    }

    public void PushLocation(LocationUpdate update)
    {
        var you = _people.FirstOrDefault(p => p.Name == "You");
        if (you is null) return;
        you.Latitude = update.Latitude;
        you.Longitude = update.Longitude;
        you.LastSeen = update.Timestamp;
        Changed?.Invoke(this, EventArgs.Empty);
    }

    public void MarkAlertRead(string id)
    {
        var a = _alerts.FirstOrDefault(x => x.Id == id);
        if (a is null) return;
        a.Read = true;
        Changed?.Invoke(this, EventArgs.Empty);
    }
}
