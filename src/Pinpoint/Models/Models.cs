using CommunityToolkit.Mvvm.ComponentModel;

namespace Pinpoint.Models;

public enum DeviceKind { Phone, Tablet, Laptop, Earbuds, Tag, Watch }

public partial class Person : ObservableObject
{
    [ObservableProperty] private string id = Guid.NewGuid().ToString("N");
    [ObservableProperty] private string name = string.Empty;
    [ObservableProperty] private string initials = string.Empty;
    [ObservableProperty] private string accent = "#7CC4FF";
    [ObservableProperty] private double latitude;
    [ObservableProperty] private double longitude;
    [ObservableProperty] private DateTime lastSeen = DateTime.UtcNow;
    [ObservableProperty] private bool sharing = true;
    [ObservableProperty] private string status = "Sharing live";
}

public partial class TrackedDevice : ObservableObject
{
    [ObservableProperty] private string id = Guid.NewGuid().ToString("N");
    [ObservableProperty] private string name = string.Empty;
    [ObservableProperty] private DeviceKind kind = DeviceKind.Phone;
    [ObservableProperty] private double latitude;
    [ObservableProperty] private double longitude;
    [ObservableProperty] private int battery = 100;
    [ObservableProperty] private DateTime lastSeen = DateTime.UtcNow;
    [ObservableProperty] private bool online = true;
    [ObservableProperty] private string owner = "You";
}

public partial class AlertItem : ObservableObject
{
    [ObservableProperty] private string id = Guid.NewGuid().ToString("N");
    [ObservableProperty] private string title = string.Empty;
    [ObservableProperty] private string subtitle = string.Empty;
    [ObservableProperty] private DateTime when = DateTime.UtcNow;
    [ObservableProperty] private bool read;
    [ObservableProperty] private string icon = "bell";
}

public record LocationUpdate(double Latitude, double Longitude, double? Accuracy, DateTime Timestamp);
