# --------------------------
# שלב Build
# --------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת קובצי csproj בלבד כדי להבטיח caching של restore
COPY *.csproj ./

# שלב restore (חובה בשביל NuGet packages, כולל Npgsql)
RUN dotnet restore

# העתקת כל הקוד
COPY . .

# בניית פרויקט ופרסום
RUN dotnet publish -c Release -o /app/publish

# --------------------------
# שלב Runtime
# --------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# העתקת הפאבליש משלב הבילד
COPY --from=build /app/publish .

# הפעלת האפליקציה
CMD ["dotnet", "EducationOrdersAPI.dll"]
