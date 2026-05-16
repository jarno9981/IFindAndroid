using Pinpoint.ViewModels;

namespace Pinpoint.Views.Auth;

public partial class SignUpPage : ContentPage
{
    public SignUpPage(AuthViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
