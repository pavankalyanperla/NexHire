FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5200

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["HRMSService.API/HRMSService.API.csproj", "HRMSService.API/"]
COPY ["HRMSService.Infrastructure/HRMSService.Infrastructure.csproj", "HRMSService.Infrastructure/"]
COPY ["HRMSService.Application/HRMSService.Application.csproj", "HRMSService.Application/"]
COPY ["HRMSService.Domain/HRMSService.Domain.csproj", "HRMSService.Domain/"]
RUN dotnet restore "HRMSService.API/HRMSService.API.csproj"
COPY . .
WORKDIR "/src/HRMSService.API"
RUN dotnet build "HRMSService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HRMSService.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HRMSService.API.dll"]
