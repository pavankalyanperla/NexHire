FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "RecruitmentService.API/RecruitmentService.API.csproj"
RUN dotnet publish "RecruitmentService.API/RecruitmentService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5300
ENTRYPOINT ["dotnet", "RecruitmentService.API.dll"]
