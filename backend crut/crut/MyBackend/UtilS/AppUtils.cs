namespace MyBackend.UTILS;

public static class AppUtils
{
    // Base64 decode
    public static string DecodeBase64(string value)
    {
        byte[] bytes = Convert.FromBase64String(value);

        return System.Text.Encoding.UTF8.GetString(bytes);
    }

    // Base64 encode
    public static string EncodeBase64(string value)
    {
        byte[] bytes =
            System.Text.Encoding.UTF8.GetBytes(value);

        return Convert.ToBase64String(bytes);
    }
}