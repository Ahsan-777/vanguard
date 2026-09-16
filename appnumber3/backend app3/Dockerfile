# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["backend app3.csproj", "./"]
RUN dotnet restore "backend app3.csproj"
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5038
ENV ASPNETCORE_URLS=http://+:5038
ENTRYPOINT ["dotnet", "backend app3.dll"]