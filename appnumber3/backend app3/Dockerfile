# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend_app3.csproj", "./"]
RUN dotnet restore "backend_app3.csproj"
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5038
ENV ASPNETCORE_URLS=http://+:5038
ENTRYPOINT ["dotnet", "backend_app3.dll"]