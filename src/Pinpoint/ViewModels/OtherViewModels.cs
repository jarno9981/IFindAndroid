using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Pinpoint.Models;
using Pinpoint.Services;

namespace Pinpoint.ViewModels;

public partial class PeopleViewModel : ObservableObject
{
    private readonly ISharingService _sharing;
    public ObservableCollection<Person> People { get; } = new();

    public PeopleViewModel(ISharingService sharing)
    {
        _sharing = sharing;
        Reload();
        sharing.Changed += (_, _) => MainThread.BeginInvokeOnMainThread(Reload);
    }
    void Reload()
    {
        People.Clear();
        foreach (var p in _sharing.People) People.Add(p);
    }
}

public partial class DevicesViewModel : ObservableObject
{
    private readonly ISharingService _sharing;
    public ObservableCollection<TrackedDevice> Devices { get; } = new();
    [ObservableProperty] private string searchText = string.Empty;

    public DevicesViewModel(ISharingService sharing)
    {
        _sharing = sharing;
        Reload();
        sharing.Changed += (_, _) => MainThread.BeginInvokeOnMainThread(Reload);
    }
    void Reload()
    {
        Devices.Clear();
        foreach (var d in _sharing.Devices) Devices.Add(d);
    }

    [RelayCommand] void PlaySound(TrackedDevice? d) { /* hook to platform sound */ }
}

public partial class AlertsViewModel : ObservableObject
{
    private readonly ISharingService _sharing;
    public ObservableCollection<AlertItem> Alerts { get; } = new();

    public AlertsViewModel(ISharingService sharing)
    {
        _sharing = sharing;
        Reload();
        sharing.Changed += (_, _) => MainThread.BeginInvokeOnMainThread(Reload);
    }
    void Reload()
    {
        Alerts.Clear();
        foreach (var a in _sharing.Alerts) Alerts.Add(a);
    }

    [RelayCommand] void MarkRead(AlertItem? a) { if (a is not null) _sharing.MarkAlertRead(a.Id); }
}
