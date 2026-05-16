using Pinpoint.ViewModels;

namespace Pinpoint.Views.Auth;

public partial class SignInPage : ContentPage
{
    public SignInPage(AuthViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
