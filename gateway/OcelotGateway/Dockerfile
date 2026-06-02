FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "OcelotGateway.csproj"
RUN dotnet publish "OcelotGateway.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
COPY ocelot.json .
EXPOSE 5000
ENTRYPOINT ["dotnet", "OcelotGateway.dll"]
