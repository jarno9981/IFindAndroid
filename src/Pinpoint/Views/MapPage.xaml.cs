using Pinpoint.ViewModels;

namespace Pinpoint.Views;

public partial class MapPage : ContentPage
{
    public MapPage(MapViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
