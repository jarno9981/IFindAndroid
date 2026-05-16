namespace Pinpoint.Controls;

public class AvatarView : Border
{
    public static readonly BindableProperty InitialsProperty =
        BindableProperty.Create(nameof(Initials), typeof(string), typeof(AvatarView), string.Empty, propertyChanged: OnChanged);
    public static readonly BindableProperty AccentProperty =
        BindableProperty.Create(nameof(Accent), typeof(string), typeof(AvatarView), "#7CC4FF", propertyChanged: OnChanged);
    public static readonly BindableProperty SizeProperty =
        BindableProperty.Create(nameof(Size), typeof(double), typeof(AvatarView), 40d, propertyChanged: OnChanged);

    public string Initials { get => (string)GetValue(InitialsProperty); set => SetValue(InitialsProperty, value); }
    public string Accent { get => (string)GetValue(AccentProperty); set => SetValue(AccentProperty, value); }
    public double Size { get => (double)GetValue(SizeProperty); set => SetValue(SizeProperty, value); }

    private readonly Label _label;

    public AvatarView()
    {
        _label = new Label
        {
            HorizontalOptions = LayoutOptions.Center,
            VerticalOptions = LayoutOptions.Center,
            FontAttributes = FontAttributes.Bold,
            FontSize = 14,
            TextColor = Colors.White
        };
        Content = _label;
        StrokeThickness = 0;
        Padding = 0;
        Apply();
    }

    static void OnChanged(BindableObject b, object oldV, object newV) => ((AvatarView)b).Apply();

    void Apply()
    {
        WidthRequest = Size;
        HeightRequest = Size;
        StrokeShape = new RoundRectangle { CornerRadius = (float)(Size / 2) };
        try { BackgroundColor = Color.FromArgb(Accent); }
        catch { BackgroundColor = Colors.SteelBlue; }
        _label.Text = Initials;
        _label.FontSize = Size * 0.36;
    }
}
