using System.Globalization;

namespace Pinpoint.Converters;

public class BoolToShareTextConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => (value is bool b && b) ? "Sharing" : "Paused";
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotImplementedException();
}

public class BoolToShareColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => (value is bool b && b) ? Color.FromArgb("#87E0A9") : Color.FromArgb("#6A7180");
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotImplementedException();
}

public class BatteryToColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var v = value is int i ? i : 100;
        if (v < 20) return Color.FromArgb("#FF8A87");
        if (v < 50) return Color.FromArgb("#FFB787");
        return Color.FromArgb("#87E0A9");
    }
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotImplementedException();
}
