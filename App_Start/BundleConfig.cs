using System.Web;
using System.Web.Optimization;

namespace MyChat
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/bundles/css").Include(
                "~/Content/alertify/alertify.min.css",
                "~/Content/alertify/alertify.default.min.css",
                //"~/Content/alertifyjs/dist/css/alertify.css",
                "~/Content/normalize.min.css",
                "~/Content/jquery.mCustomScrollbar.min.css",
                "~/Content/main.min.css"));
            
            bundles.Add(new ScriptBundle("~/bundles/js").Include(
                "~/Scripts/jquery.signalR-1.0.1.min.js",
                "~/Scripts/mCustomScrollbar.min.js"));

            BundleTable.EnableOptimizations = true;
        }
    }
}