FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# Copy backend application files
COPY ./backenddot .

ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

ENTRYPOINT ["dotnet", "CRUDapp.dll"]
