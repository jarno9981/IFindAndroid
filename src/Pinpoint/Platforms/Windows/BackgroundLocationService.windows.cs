namespace Pinpoint.Services;

public partial class BackgroundLocationService
{
    public partial Task StartAsync() { IsRunning = true;  return Task.CompletedTask; }
    public partial Task StopAsync()  { IsRunning = false; return Task.CompletedTask; }
}
