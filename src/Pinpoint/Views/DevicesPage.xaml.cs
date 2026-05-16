using Pinpoint.ViewModels;

namespace Pinpoint.Views;

public partial class DevicesPage : ContentPage
{
    public DevicesPage(DevicesViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
