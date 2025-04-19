// src/components/HomePage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const HomePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Task Manager App
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-gray-600">
            Select an option to continue:
          </p>
          <Link to="/login">
            <Button className="w-full">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="w-full">
              Signup
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
