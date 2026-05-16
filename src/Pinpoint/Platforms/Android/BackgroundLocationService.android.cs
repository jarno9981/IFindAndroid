using Android.Content;
using Android.OS;
using Pinpoint.Platforms.Droid;
using AndroidApp = Android.App.Application;

namespace Pinpoint.Services;

public partial class BackgroundLocationService
{
    public partial Task StartAsync()
    {
        if (IsRunning) return Task.CompletedTask;
        var ctx = AndroidApp.Context;
        var intent = new Intent(ctx, typeof(LocationForegroundService));
        if (Build.VERSION.SdkInt >= BuildVersionCodes.O) ctx.StartForegroundService(intent);
        else ctx.StartService(intent);
        IsRunning = true;
        return Task.CompletedTask;
    }

    public partial Task StopAsync()
    {
        if (!IsRunning) return Task.CompletedTask;
        var ctx = AndroidApp.Context;
        ctx.StopService(new Intent(ctx, typeof(LocationForegroundService)));
        IsRunning = false;
        return Task.CompletedTask;
    }
}
