using CommunityToolkit.Maui;
using Microsoft.Extensions.Logging;
using Pinpoint.Services;
using Pinpoint.ViewModels;
using Pinpoint.Views;

namespace Pinpoint;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .UseMauiCommunityToolkit()
            .ConfigureFonts(fonts => { });

        builder.Services.AddSingleton<AuthSession>();
        builder.Services.AddSingleton<IApiClient, ApiClient>();
        builder.Services.AddSingleton<ILocationService, LocationService>();
        builder.Services.AddSingleton<ISharingService, SharingService>();
        builder.Services.AddSingleton<IBackgroundLocationService, BackgroundLocationService>();

        builder.Services.AddSingleton<MapViewModel>();
        builder.Services.AddSingleton<PeopleViewModel>();
        builder.Services.AddSingleton<DevicesViewModel>();
        builder.Services.AddSingleton<AlertsViewModel>();
        builder.Services.AddTransient<AuthViewModel>();

        builder.Services.AddSingleton<ShellPage>();
        builder.Services.AddTransient<MapPage>();
        builder.Services.AddTransient<DevicesPage>();
        builder.Services.AddTransient<PeoplePage>();
        builder.Services.AddTransient<AlertsPage>();
        builder.Services.AddTransient<Views.Auth.SignInPage>();
        builder.Services.AddTransient<Views.Auth.SignUpPage>();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
