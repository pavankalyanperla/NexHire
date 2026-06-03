FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5300

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["RecruitmentService.API/RecruitmentService.API.csproj", "RecruitmentService.API/"]
COPY ["RecruitmentService.Infrastructure/RecruitmentService.Infrastructure.csproj", "RecruitmentService.Infrastructure/"]
COPY ["RecruitmentService.Application/RecruitmentService.Application.csproj", "RecruitmentService.Application/"]
COPY ["RecruitmentService.Domain/RecruitmentService.Domain.csproj", "RecruitmentService.Domain/"]
RUN dotnet restore "RecruitmentService.API/RecruitmentService.API.csproj"
COPY . .
WORKDIR "/src/RecruitmentService.API"
RUN dotnet build "RecruitmentService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RecruitmentService.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RecruitmentService.API.dll"]
