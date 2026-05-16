using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Pinpoint.Models;
using Pinpoint.Services;

namespace Pinpoint.ViewModels;

public partial class MapViewModel : ObservableObject
{
    private readonly ISharingService _sharing;
    private readonly ILocationService _location;
    private readonly IBackgroundLocationService _background;

    [ObservableProperty] private string searchText = string.Empty;
    [ObservableProperty] private bool isSharing = true;
    [ObservableProperty] private string statusText = "Sharing live · just now";
    [ObservableProperty] private Person? selected;

    public ObservableCollection<Person> People { get; } = new();
    public ObservableCollection<TrackedDevice> Devices { get; } = new();

    public MapViewModel(ISharingService sharing, ILocationService location, IBackgroundLocationService background)
    {
        _sharing = sharing;
        _location = location;
        _background = background;
        Reload();
        _sharing.Changed += (_, _) => MainThread.BeginInvokeOnMainThread(Reload);
    }

    void Reload()
    {
        People.Clear();
        foreach (var p in _sharing.People) People.Add(p);
        Devices.Clear();
        foreach (var d in _sharing.Devices) Devices.Add(d);
        IsSharing = _sharing.IsSharing;
        StatusText = IsSharing ? "Sharing live · just now" : "Paused";
    }

    [RelayCommand]
    async Task ToggleShareAsync()
    {
        IsSharing = !IsSharing;
        await _sharing.ToggleSharingAsync(IsSharing);
        if (IsSharing)
        {
            if (await _location.RequestPermissionsAsync())
            {
                await _background.StartAsync();
                var u = await _location.GetCurrentAsync();
                if (u is not null) _sharing.PushLocation(u);
            }
        }
        else
        {
            await _background.StopAsync();
        }
    }

    [RelayCommand]
    async Task RefreshAsync()
    {
        var u = await _location.GetCurrentAsync();
        if (u is not null) _sharing.PushLocation(u);
    }

    [RelayCommand]
    void Select(Person? p) => Selected = p;
}
