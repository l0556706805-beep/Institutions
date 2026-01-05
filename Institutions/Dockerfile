# --------------------------
# Build stage
# --------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת קובצי csproj בלבד כדי לאפשר caching של restore
COPY *.csproj ./

# Restore packages
RUN dotnet restore

# העתקת כל הקוד
COPY . .

# Build + publish
RUN dotnet publish -c Release -o /app/publish

# --------------------------
# Runtime stage
# --------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# העתקת הפאבליש מהשלב הקודם
COPY --from=build /app/publish .

# CMD להרצת האפליקציה הראשית
CMD ["dotnet", "EducationOrdersAPI.dll"]
