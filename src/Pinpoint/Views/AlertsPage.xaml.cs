using Pinpoint.ViewModels;

namespace Pinpoint.Views;

public partial class AlertsPage : ContentPage
{
    public AlertsPage(AlertsViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
