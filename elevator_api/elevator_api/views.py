from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from .models import Elevator, ElevatorConfiguration
from .serializers import ElevatorSerializer, ElevatorConfigurationSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.views import View


class ElevatorRequestView(APIView):
    def post(self, request):
        try:
            to_floor = request.data.get('to_floor')
            elevator_id = request.data.get('elevatorId')

            # Find the elevator
            elevator = Elevator.objects.get(id=elevator_id)

            # Move the elevator to the requested floor
            elevator.floor = to_floor  # Update the current floor
            elevator.save()

            # Update the destinations of the elevator
            elevator.destinations.append(to_floor)  # Assuming destinations is a list field in the Elevator model
            elevator.save()

            return Response({'message': 'Elevator requested successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)



class ElevatorStatusView(APIView):
    def get(self, request):
        try:
            elevators = Elevator.objects.all()
            elevator_data = []
            for elevator in elevators:
                elevator_data.append({
                    'id': elevator.id,  # Include elevator ID
                    'floor': elevator.floor,
                    'destinations': elevator.destinations
                })
            return Response(elevator_data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)



class ElevatorConfigView(APIView):
    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        try:
            # Fetch elevator configurations
            elevator_configs = ElevatorConfiguration.objects.all()
            serialized_configs = ElevatorConfigurationSerializer(elevator_configs, many=True).data

            # Construct lift data from elevator configurations
            lift_data = [{'elevator': config['elevator'], 'serviced_floors': config['serviced_floors']} 
                         for config in serialized_configs]

            # Create a JSON response with lift data
            response = JsonResponse({'lifts': lift_data})

            # Add CORS headers
            response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

            return response
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)