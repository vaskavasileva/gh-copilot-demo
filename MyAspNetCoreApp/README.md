# MyAspNetCoreApp

This is an ASP.NET Core 9.0 web application that includes three main views: Index, Users, and Products. 

## Project Structure

- **Controllers**: Contains the controllers that handle user requests.
  - `HomeController.cs`: Manages the home page.
  - `UsersController.cs`: Manages user-related actions.
  - `ProductsController.cs`: Manages product-related actions.

- **Views**: Contains the Razor views for the application.
  - **Home**
    - `Index.cshtml`: The home page view.
  - **Users**
    - `Index.cshtml`: The view for displaying users.
  - **Products**
    - `Index.cshtml`: The view for displaying products.

- **Models**: Contains the data models used in the application.
  - `User.cs`: Defines the User class with properties like Id, Name, and Email.
  - `Product.cs`: Defines the Product class with properties like Id, Name, and Price.

- **Configuration**
  - `appsettings.json`: Contains configuration settings for the application.
  - `Program.cs`: The entry point of the application, setting up the web host and configuring services and middleware.
  - `MyAspNetCoreApp.csproj`: The project file specifying dependencies and project settings.

## Getting Started

To run the application, ensure you have the .NET SDK installed. Use the following commands:

1. Restore dependencies:
   ```
   dotnet restore
   ```

2. Run the application:
   ```
   dotnet run
   ```

Visit `http://localhost:5000` in your browser to view the application.