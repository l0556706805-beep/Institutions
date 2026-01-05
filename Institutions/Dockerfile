# --------------------------
# שלב Build
# --------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת כל קבצי csproj מתיקיות משנה
COPY **/*.csproj ./ 

# Restore לכל הפרויקטים
RUN dotnet restore

# העתקת כל הקוד
COPY . .

# Build ו־publish לכל הפרויקטים
RUN dotnet publish EducationOrdersAPI/EducationOrdersAPI.csproj -c Release -o /app/publish

# --------------------------
# שלב Runtime
# --------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# העתקת הפאבליש משלב הבילד
COPY --from=build /app/publish .

# הפעלת האפליקציה
CMD ["dotnet", "EducationOrdersAPI.dll"]
