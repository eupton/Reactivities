# Building a new social activities platform
## Trick of vs code
  * sometimes to get quickfix (cntrl .) doesn't work after nuget package install
    * use **dotnet restore** in the terminal

## Prepare for the project
### install vs code extensions
  * SQLite by alexcvzz for exploring sqlite database from vs code
    * usage: cntrl-shift-p> then type sqlite and select [sqlite: open database] then select the db file name to open the sqlite tools

## Create the project from the command line
* separated the solution into multiple projects

### We'll have the following projects within Reactivities solution:
* API - Will hold the controllers, routing, logic for performing actions on our data and returning results to the requesting client. Our api will follow a cqrs pattern
* Application - will hold most of our business logic and handle the Mediator Design Pattern's Commands and Queries
* Domain - The home for our data model definitions
* Persistence - How we'll connect to our persistent data store (SQLite for development)

### Here are the commands needed to create and configure the project from the CLI:
PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet new sln**
The template "Solution File" was created successfully.
PS C:\Users\eupton\source\repos\practice\reactivities> **ls**


  Directory: C:\Users\eupton\source\repos\practice\reactivities

----------------

PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet new webapi -n API**

Processing post-creation actions...
Running 'dotnet restore' on API\API.csproj...
  Determining projects to restore...
  Restored C:\Users\eupton\source\repos\practice\reactivities\API\API.csproj (in 194 ms).
Restore succeeded.

PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet new classlib -n Application**
The template "Class library" was created successfully.

Processing post-creation actions...
Running 'dotnet restore' on Application\Application.csproj...
  Determining projects to restore...
Restore succeeded.

PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet new classlib -n Domain**
The template "Class library" was created successfully.

Processing post-creation actions...
  Restored C:\Users\eupton\source\repos\practice\reactivities\Domain\Domain.csproj (in 56 ms).
The template "Class library" was created successfully.
Processing post-creation actions...
Restore succeeded.
Project `API\API.csproj` added to the solution.
PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet sln add .\Application\**
Project `Application\Application.csproj` added to the solution.
PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet sln add .\Domain\**
Project `Domain\Domain.csproj` added to the solution.
PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet sln add .\Persistence\**
Project `Persistence\Persistence.csproj` added to the solution.
PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet sln**
Required command was not provided.
Usage: dotnet sln [options] <SLN_FILE> [command]

Arguments:
  <SLN_FILE>   The solution file to operate on. If not specified, the command will search the current directory for one.

Options:
  -h, --help   Show command line help.

Commands:
  add <PROJECT_PATH>      Add one or more projects to a solution file.
  list                    List all projects in a solution file.
  remove <PROJECT_PATH>   Remove one or more projects from a solution file.

PS C:\Users\eupton\source\repos\practice\reactivities> **dotnet sln list**
Project(s)
----------
API\API.csproj
Application\Application.csproj
Domain\Domain.csproj
Persistence\Persistence.csproj
PS C:\Users\eupton\source\repos\practice\reactivities> **cd api**
PS C:\Users\eupton\source\repos\practice\reactivities\api> **dotnet add reference ../Application**
Reference `..\Application\Application.csproj` added to the project.
PS C:\Users\eupton\source\repos\practice\reactivities\api> **cd ..**
PS C:\Users\eupton\source\repos\practice\reactivities> **cd application**
PS C:\Users\eupton\source\repos\practice\reactivities\application> **dotnet add reference ../Persistence**
Reference `..\Persistence\Persistence.csproj` added to the project.
PS C:\Users\eupton\source\repos\practice\reactivities\application> **dotnet add reference ../Domain**    
Reference `..\Domain\Domain.csproj` added to the project.
PS C:\Users\eupton\source\repos\practice\reactivities\application> **cd ..**
PS C:\Users\eupton\source\repos\practice\reactivities> **cd .\Persistence\**
PS C:\Users\eupton\source\repos\practice\reactivities\Persistence> **dotnet add reference ../Domain**
Reference `..\Domain\Domain.csproj` added to the project.
PS C:\Users\eupton\source\repos\practice\reactivities\Persistence> **cd ..**
PS C:\Users\eupton\source\repos\practice\reactivities> **code .**

### Create dbcontext in the Persistence Project
* install dependencies for **Microsoft.EntityFrameworkCore.Sqlite** via nuget in the persistence project
* install dependencies for **Microsoft.EntityFrameworkCore.Design** via nuget into the API project

### Create DataContext : dbcontext in the Persistence Project

```C#
public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Activity> Activities { get; set; }
    }   
```

### Register dbcontext in API services
* use setup the connection to sqlite
* connection string being read from appsettings.Development.json

```C#
//startup.cs
services.AddDbContext<DataContext>(opt =>
            {
                opt.UseSqlite(_config.GetConnectionString("DefaultConnection"));
            });
```

appsettings.Development.json
```json
  "ConnectionStrings": {
    "DefaultConnection": "Data source=reactivities.db"
  }
```


### Create EntityFramework Migrations
* check dotnet-ef installed version with CLI: dotnet tool list --global
    * update or install if necessary: dotnet tool update --global dotnet-ef || dotnet tool install --global dotnet-ef
        *Tool 'dotnet-ef' was successfully updated from version '5.0.3' to version '5.0.4'.*
        *dotnet ef -h for help*

* Create initial migrations: -p switch is for Project Containing dbcontext, -s is for startup project
    * dotnet ef migrations add InitialCreate -p Persistence -s API
        *Entity Framework Core 5.0.4 initialized 'DataContext' using provider 'Microsoft.EntityFrameworkCore.Sqlite' with options: None*


### Create Database 
* there are multiple options to create the database *using the migrations we created*
    * from the command line use the dotnet ef cli tool **[dotnet ef database ...]**
        * **dotnet ef database -h** *for help*
        * **dotnet ef database update -p Persistence -s API**
        * DROP DATABASE TO START FRESH: **dotnet ef database drop -s API -p Persistence**
    * via code
        * automatically applying the migrations in code
        * modify the API application entry point as follows:
        
        ```C#
        public static void Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();
            using var scope = host.Services.CreateScope();

            var services = scope.ServiceProvider;
            try
            {
                var context = services.GetRequiredService<DataContext>();
                context.Database.Migrate();
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occurred while applying data migrations");
            }

            host.Run();
        }
        ```
      
### Git Setup
* **git status** is this solution part of source control?
* **git init** initialize local git repo
  * initially shows tons on files that need to be loaded to git repo 
  * use microsoft's gitignore template to exclude unnecessary files from source control
    * run **dotnet new gitignore**
    * *run **dotnet new -l** to list all available templates*
  * create github repo
    * run **git stage -A** to stage all changed files
    * run **git commit -m "initial commit"**
    * run **git branch -M main**
    * run **git remote add origin https://github.com/eupton/reponame.git**
    * run **git push -u origin main**
    
## Create React Client Application
* **npx create-react-app client-app --use-npm --template typescript**

### Update CORS policy on api

  add to Startup.ConfigureServices(...)
  ```C#
  services.AddCors(opt => 
            {
                opt.AddPolicy("CorsPolicy", policy =>
                {
                    policy.AllowAnyMethod().AllowAnyHeader().WithOrigins("http://localhost:3000");
                });
            });
  ```

  add to Startup.Configure(...)
  ```C#
    ...
    app.UseRouting();

    app.UseCors("CorsPolicy");
    ...
  ```

### Install semantic ui css framework into client-app project folder
* **npm install semantic-ui-react semantic-ui-css**

### Add MediatR to the Application and API projects to implement the mediator behavioral design pattern
* use nuget to install mediatr.microsoft.dependencyinjection
* https://refactoring.guru/design-patterns/mediator

### Add automapper to Application Project
* use nuget gallery to install Automatpper.microsoft.dependencyinjection
* will "automap" the payload from the client to properties of the entity objects on the server.

#### Create mapping profile in Application.Core
* inherits Automapper.Profile
* Create a mapping definition for AutoMapper

```C#
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Activity, Activity>();
        }
    }
```

* configure dependency injection services for MediatR and Automapper in API.Startup.ConfigureServices method

```C#
    ...
      services.AddMediatR(typeof(List.Handler).Assembly);
      services.AddAutoMapper(typeof(Application.Core.MappingProfiles).Assembly);
    ...
```

### State management: Install and setup mobx and mobx-react-lite 
* **npm i mobx mobx-react-lite**
* mobx can have multiple stores (redux only has one store)
* is written in typescript so plays nicely with projects written in typescript

provide the store to the application index.tsx
```javascript
import...
...
import { store, StoreContext } from './app/stores/store';

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </StoreContext.Provider>,
  document.getElementById('root')
);
```

### Add react routing via react-router-dom
* *npm i react-router-dom*
* *npm i @types/react-router-dom --save-dev*

add routing by wrapping our <App /> component with <BrowserRouter /> in the index.tsx
```javascript
import...
...
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  ...
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ...
);
```
### API Validation and Exception Handling

#### Add FluentValidation nuget package into Application Project

#### Create Validators for Domain Objects
* Using fluent validation create an ActivityValidator object and wire it up to the Mediatr Handlers

```C#
    public class ActivityValidator : AbstractValidator<Activity>
    {
        public ActivityValidator()
        {
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Date).NotEmpty();
            RuleFor(x => x.Category).NotEmpty();
            RuleFor(x => x.City).NotEmpty();
            RuleFor(x => x.Venue).NotEmpty();
        }
    }


    ///Create handler
    public class Create
    {
        ...
        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Activity).SetValidator(new ActivityValidator());
            }
        }
        ...
    }
```

* also in the API startup.cs add a service for fluent validation and point it to the project mediatr handlers/fluent validators
```C#
  public void ConfigureServices(IServiceCollection services)
  {
    ...
      services.AddControllers().AddFluentValidation(config => 
      {
          config.RegisterValidatorsFromAssemblyContaining<Create>();
      });
    ...
```

#### Setup middleware on API project to handle exceptions
* create ExceptionMiddleware for processing exceptions
* wireup the API application to use the new exception processing

```C#
    ///Api.Middleware.ExceptionMiddleware.cs
    public class ExceptionMiddleware
    {
        ...
    }
    

    ///startup.cs
    public void Configure(...)
    {
        app.UseMiddleware<ExceptionMiddleware>();
        ...
    }
```

#### Client validation and error handling
* install react-toastify **npm install react-toastify**
* setup the axios agent.tsx to intercept errors passed from the api and provide various notifications and routing accordingly
* setup new mobx store for common app state and error data
* items of interest: 
  * created serverError.ts to create a new interface ServerError
  * created ServerError.tsx component for displaying server errors and added new route to navigate user when server error 500 occurs
  * create commonStore.ts for new mobx store
  * updated store.ts to include commonStore
  * modify axios (agent.tsx) to handle errors
  * setup Router to use history (index.tsx) and use history.push(...) to send user to an error page
    * update index.tsx to use <Router></Router> instead of <BrowserRouter></BrowserRouter>

index.tsx
```C#
import { createBrowserHistory } from 'history'; //part of react-router

export const history = createBrowserHistory();

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <Router history={history}>
      <App />
    </Router>
    ...
```

agent.tsx
```C#
  axios.interceptors.response.use(async response => {
    ...
    switch(status) {
        case 400:
            ...
        case 401:
            ...
        case 404:
            ...
            history.push('/not-found');
        case 500:
            ...
            store.commonStore.setServerError(data);
            history.push('/server-error');
            break;
    }
    return Promise.reject(error);
})
```
### supercharging our forms
* install formik **npm i formik**
* install yub for validation **npm i yup --save**
* install typescript for yup **npm i @types/yup**
* install react-datepicker **npm i react-datepicker** and **npm i @types/react-datepicker --save-dev**
* install date-fns same version as react-datepick is using check date-fns version with **npm ls date-fns**
* install date-fns with matching version **npm i date-fns@2.19.0**
### 


### Authentication

#### Creating the user entity and wiring up the dbcontext
* Create the user entity. Inherit user class from IdentityUser.

```C#
public class AppUser : IdentityUser
```

* update the datacontext to inherit IdentityDbContext<T> where T is type of UserEntity instead of DbContect
* by inheriting form IdentityDbContext EF will automatically generate the requisite tables for the AppUser : IdentityUser information

```C# 
public class DataContext : IdentityDbContext<AppUser>
```

* add new migrations for the identity classes
  * **dotnet ef migrations add IdentityAdded -p Persistence -s API**


#### Seed user data
* Seed database with default users
  * update the SeedData signature to take a usermanager argument

```C# 
  public static async Task SeedData(DataContext context, UserManager<AppUser> userManager)
  {
      if (!userManager.Users.Any())
      {
          var users = new List<AppUser>
          {
              new AppUser{DisplayName = "Bob", UserName = "bob", Email = "bob@test.com"},
              new AppUser{DisplayName = "Tom", UserName = "tom", Email = "Tom@test.com"},
              new AppUser{DisplayName = "Jane", UserName = "jane", Email = "jane@test.com"}
          };

          foreach (var user in users)
          {
              await userManager.CreateAsync(user, "Pa$$w0rd");
          }
      }
  }
```

* in the API.Program.cs get the usermanager service and pass it to the seedData method
```C#
  ...
  var userManager = services.GetRequiredService<UserManager<AppUser>>();
  await Seed.SeedData(context, userManager);
  ...
```

#### Create the JWT Service (Json Web Token)
* install Microsoft.IdentityModel.Tokens nuget package
* install System.IdentityModel.Tokens.Jwt nuget package
* create TokenService class that generates a token for validated users

```C#
    public class TokenService
    {
        public string CreateToken(AppUser user)
        {
    ...
```

* add scoped token service to the IServiceCollection in ConfigureServices so that we can use it with dependency injection

```C#
  //putting this in IdentityServiceExtensions which is called from within startup.configureservices method
  services.AddScoped<TokenService>();
```

* install Microsoft.AspNetCore.Authentication.JwtBearer nuget package
* configure the authentication service to use the jwt tokens 

```C#
  //updated the services.AddAuthentication with a new authenticationscheme
  services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt => 
    {
        opt.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
```

* update the startup.cs to be able to use authentication
* this must come before the app.UseAuthorization()
```C#
  public void Configure(...)
  {
    ...
    app.UseAuthentication(); //must come before app.UseAuthorization()
    app.UseAuthorization();
    ...
  }
```



#### Storing App Secrets
**Note on storing app secrets in the application**
https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-5.0&tabs=windows#secret-manager

* for dev purposes we'll store our token key inside of appsettings.Development.json as
```json
  "TokenKey": "super secret key"
```
* this can be accessed via the injected IConfiguration instance such as
```C#
    public class TokenService
    {
        public TokenService(IConfiguration config)
        {
          var key = config["TokenKey"];
        }
        ...
    }
```

#### Authorization Policy
* setup policy to require authorization for every API unless explicitly setup otherwise

```C#
  /// configured the opt to require authorization on every api controller by default
  services.AddControllers(opt => 
  {
      var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
      opt.Filters.Add(new AuthorizeFilter(policy));
  })
  .AddFluentValidation(config => 
```

* to restrict individual apiController methods and require auth, decorate the method with [Authorize] attribute
```C#
  [Authorize]
  [HttpGet("{id}")]
  public async Task<IActionResult> GetActivity(Guid id)
```

* allow anonymous api call on the Login method of the AccountController using the [AllowAnonymous] attribute

```C#
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    ...
```