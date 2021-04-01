using System.Threading.Tasks;
using Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProfilesController : BaseApiController
    {
        [HttpGet("{username}")]
        public async Task<IActionResult> GetProfile(string username)
        {
            return HandleResult(await Mediator.Send(new Details.Query{Username = username}));
        }

        //[Authorize(Policy = "IsActivityHost")]
        [HttpPut("{username}")]
        public async Task<IActionResult> EditProfile(string username, Profile profile)
        {
            profile.Username = username;
            return HandleResult(await Mediator.Send(new Edit.Command {Profile = profile}));

        }
    }
} 