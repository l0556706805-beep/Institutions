# --------------------------
# Build stage
# --------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת כל קבצי csproj עם תת-תיקיות
COPY ["EducationOrdersAPI/EducationOrdersAPI.csproj", "EducationOrdersAPI/"]

# Restore packages
RUN dotnet restore "EducationOrdersAPI/EducationOrdersAPI.csproj"

# העתקת כל הקוד
COPY . .

# Build ו-Publish
RUN dotnet publish "EducationOrdersAPI/EducationOrdersAPI.csproj" -c Release -o /app/publish

# --------------------------
# Runtime stage
# --------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# העתקת הפאבליש משלב הבילד
COPY --from=build /app/publish .

# הפעלת האפליקציה
CMD ["dotnet", "EducationOrdersAPI.dll"]
