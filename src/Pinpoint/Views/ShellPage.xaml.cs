using Pinpoint.Services;

namespace Pinpoint.Views;

public partial class ShellPage : Shell
{
    readonly AuthSession _session;

    public ShellPage(AuthSession session)
    {
        InitializeComponent();
        _session = session;
        _session.Changed += (_, _) => MainThread.BeginInvokeOnMainThread(ApplyRoute);
    }

    protected override async void OnNavigated(ShellNavigatedEventArgs args)
    {
        base.OnNavigated(args);
        await EnsureLoadedAsync();
    }

    bool _loaded;
    async Task EnsureLoadedAsync()
    {
        if (_loaded) return;
        _loaded = true;
        await _session.LoadAsync();
        ApplyRoute();
    }

    void ApplyRoute()
    {
        var target = _session.IsSignedIn ? "//main" : "//auth/signin";
        if (Current?.CurrentState?.Location?.OriginalString != target)
            Dispatcher.Dispatch(async () => { try { await GoToAsync(target); } catch { } });
    }
}
