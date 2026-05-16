namespace Pinpoint.Services;

public partial class BackgroundLocationService : IBackgroundLocationService
{
    public bool IsRunning { get; private set; }

    public partial Task StartAsync();
    public partial Task StopAsync();
}
