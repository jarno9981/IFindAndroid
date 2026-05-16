namespace Pinpoint;

public partial class App : Application
{
    public App(Views.ShellPage shell)
    {
        InitializeComponent();
        UserAppTheme = AppTheme.Dark;
        MainPage = shell;
    }
}
