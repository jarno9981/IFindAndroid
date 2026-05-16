using Pinpoint.ViewModels;

namespace Pinpoint.Views;

public partial class PeoplePage : ContentPage
{
    public PeoplePage(PeopleViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
