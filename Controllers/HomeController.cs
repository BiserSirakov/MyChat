using System.IO;
using System.Web;
using System.Web.Mvc;

namespace MyChat.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult New()
        {
            return View();
        }

        public ActionResult UploadFile(HttpPostedFileBase file)
        {
            if (file == null)
            {
                return HttpNotFound();
            }

            if (file.ContentLength > 5000000)
            {
                return HttpNotFound();
            }

            string folderPath = Server.MapPath("~/Uploads/");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            
            file.SaveAs(Path.Combine(folderPath, Path.GetFileName(file.FileName)));

            return Json(new { fileName = file.FileName });
        }
    }
}
