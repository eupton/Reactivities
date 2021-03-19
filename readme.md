# Building a new social activities platform

## Create the project from the command line
* separated the solution into multiple projects

### We'll have the following projects within Reactivities solution:
* API - Will hold the controllers, routing, logic for performing actions on our data and returning results to the requesting client. Our api will follow a cqrs pattern
* Application
* Domain - The home for our data model definitions
* Persistence - How we'll connect to our persistent data store (SQLite for development)

###Here are the commands I ran to create and configure the project from the CLI:
PS C:\Users\eupton\source\repos\practice\reactivities> dotnet new sln
The template "Solution File" was created successfully.
PS C:\Users\eupton\source\repos\practice\reactivities> ls


    Directory: C:\Users\eupton\source\repos\practice\reactivities

----                -------------         ------ ----

PS C:\Users\eupton\source\repos\practice\reactivities> dotnet new webapi -n API

Processing post-creation actions...
Running 'dotnet restore' on API\API.csproj...
  Determining projects to restore...
  Restored C:\Users\eupton\source\repos\practice\reactivities\API\API.csproj (in 194 ms).
Restore succeeded.

PS C:\Users\eupton\source\repos\practice\reactivities> dotnet new classlib -n Application
The template "Class library" was created successfully.

Processing post-creation actions...
Running 'dotnet restore' on Application\Application.csproj...
  Determining projects to restore...
Restore succeeded.

PS C:\Users\eupton\source\repos\practice\reactivities> dotnet new classlib -n Domain
The template "Class library" was created successfully.

Processing post-creation actions...
  Restored C:\Users\eupton\source\repos\practice\reactivities\Domain\Domain.csproj (in 56 ms).
The template "Class library" was created successfully.
Processing post-creation actions...
Restore succeeded.
Project `API\API.csproj` added to the solution.
PS C:\Users\eupton\source\repos\practice\reactivities> dotnet sln add .\Application\
Project `Application\Application.csproj` added to the solution.
PS C:\Users\eupton\source\repos\practice\reactivities> dotnet sln add .\Domain\
Project `Domain\Domain.csproj` added to the solution.
PS C:\Users\eupton\source\repos\practice\reactivities> dotnet sln add .\Persistence\
Project `Persistence\Persistence.csproj` added to the solution.
PS C:\Users\eupton\source\repos\practice\reactivities> dotnet sln
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
PS C:\Users\eupton\source\repos\practice\reactivities> dotnet sln list
Project(s)
----------
API\API.csproj
Application\Application.csproj
Domain\Domain.csproj
Persistence\Persistence.csproj
PS C:\Users\eupton\source\repos\practice\reactivities> cd api
PS C:\Users\eupton\source\repos\practice\reactivities\api> dotnet add reference ../Application
Reference `..\Application\Application.csproj` added to the project.
PS C:\Users\eupton\source\repos\practice\reactivities\api> cd ..
PS C:\Users\eupton\source\repos\practice\reactivities> cd application
PS C:\Users\eupton\source\repos\practice\reactivities\application> dotnet add reference ../Persistence
Reference `..\Persistence\Persistence.csproj` added to the project.
PS C:\Users\eupton\source\repos\practice\reactivities\application> dotnet add reference ../Domain       
Reference `..\Domain\Domain.csproj` added to the project.
PS C:\Users\eupton\source\repos\practice\reactivities\application> cd .. 
PS C:\Users\eupton\source\repos\practice\reactivities> cd .\Persistence\
PS C:\Users\eupton\source\repos\practice\reactivities\Persistence> dotnet add reference ../Domain
Reference `..\Domain\Domain.csproj` added to the project.
PS C:\Users\eupton\source\repos\practice\reactivities\Persistence> cd ..
PS C:\Users\eupton\source\repos\practice\reactivities> code .

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
    * **dotnet new gitignore**
    * *use **dotnet new -l** to list all available templates*
    
