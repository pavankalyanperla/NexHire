FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["OcelotGateway.csproj", "."]
RUN dotnet restore "OcelotGateway.csproj"
COPY . .
RUN dotnet build "OcelotGateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "OcelotGateway.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY ocelot.json .
ENTRYPOINT ["dotnet", "OcelotGateway.dll"]
