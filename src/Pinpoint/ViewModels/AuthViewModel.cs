using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Pinpoint.Services;

namespace Pinpoint.ViewModels;

public partial class AuthViewModel : ObservableObject
{
    readonly IApiClient _api;
    readonly AuthSession _session;

    [ObservableProperty] private string email = string.Empty;
    [ObservableProperty] private string password = string.Empty;
    [ObservableProperty] private string name = string.Empty;
    [ObservableProperty] private bool isBusy;
    [ObservableProperty] private string? errorText;

    public AuthViewModel(IApiClient api, AuthSession session)
    {
        _api = api;
        _session = session;
    }

    [RelayCommand]
    async Task SignInAsync()
    {
        if (IsBusy) return;
        ErrorText = null;
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        { ErrorText = "Enter your email and password."; return; }
        try
        {
            IsBusy = true;
            var r = await _api.SignInAsync(Email.Trim(), Password);
            await _session.SetAsync(r);
            await Shell.Current.GoToAsync("//main");
        }
        catch (ApiException ex) when (ex.Status == 401) { ErrorText = "Wrong email or password."; }
        catch (Exception ex) { ErrorText = "Couldn't reach the server: " + ex.Message; }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    async Task SignUpAsync()
    {
        if (IsBusy) return;
        ErrorText = null;
        if (string.IsNullOrWhiteSpace(Name) || string.IsNullOrWhiteSpace(Email) || Password.Length < 6)
        { ErrorText = "Name, email, and a 6+ char password are required."; return; }
        try
        {
            IsBusy = true;
            var r = await _api.SignUpAsync(Email.Trim(), Password, Name.Trim());
            await _session.SetAsync(r);
            await Shell.Current.GoToAsync("//main");
        }
        catch (ApiException ex) when (ex.Status == 409) { ErrorText = "That email is already registered."; }
        catch (Exception ex) { ErrorText = "Couldn't reach the server: " + ex.Message; }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    async Task GoToSignUpAsync() => await Shell.Current.GoToAsync("//auth/signup");

    [RelayCommand]
    async Task GoToSignInAsync() => await Shell.Current.GoToAsync("//auth/signin");
}
