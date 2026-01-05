# --------------------------
# Build stage
# --------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת כל הקבצים הראשיים כדי שנוכל למצוא את ה-csproj
COPY . . 

# מציאת קובץ csproj ראשון (אם יש כמה, לוקח את הראשון)
RUN csproj=$(find . -name "*.csproj" | head -n 1) && \
    echo "Found csproj: $csproj" && \
    dotnet restore "$csproj" && \
    dotnet publish "$csproj" -c Release -o /app/publish

# --------------------------
# Runtime stage
# --------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# העתקת הפאבליש משלב הבילד
COPY --from=build /app/publish .

# הפעלת האפליקציה
CMD ["dotnet", "EducationOrdersAPI.dll"]
