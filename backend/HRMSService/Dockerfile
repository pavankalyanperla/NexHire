FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "HRMSService.API/HRMSService.API.csproj"
RUN dotnet publish "HRMSService.API/HRMSService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5200
ENTRYPOINT ["dotnet", "HRMSService.API.dll"]
