namespace Pinpoint;

public partial class App : Application
{
    readonly IServiceProvider _services;

    public App(IServiceProvider services)
    {
        InitializeComponent();
        _services = services;
        UserAppTheme = AppTheme.Dark;
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        var shell = _services.GetRequiredService<Views.ShellPage>();
        return new Window(shell);
    }
}
