from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Elevator, ElevatorConfiguration
from .serializers import ElevatorStatusSerializer, ElevatorConfigurationSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator


class ElevatorRequestView(APIView):
    def post(self, request):
        try:
            to_floor = request.data.get('to_floor')
            elevator_id = request.data.get('elevatorId')

            elevator = Elevator.objects.get(id=elevator_id)

            elevator.destinations = []
            if to_floor > elevator.floor:
                for d in range(elevator.floor, to_floor + 1):
                    elevator.destinations.append(d)
            else:
                for d in range(to_floor, elevator.floor + 1):
                    elevator.destinations.append(d)
            elevator.floor = to_floor
            elevator.save()

            return Response({'message': 'Elevator requested successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ElevatorStatusView(APIView):
    def get(self, request):
        try:
            elevators = Elevator.objects.all()
            elevator_data = ElevatorStatusSerializer(elevators, many=True).data
            return Response(elevator_data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ElevatorConfigView(APIView):
    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        try:
            elevator_configs = ElevatorConfiguration.objects.all()
            serialized_configs = ElevatorConfigurationSerializer(elevator_configs, many=True).data

            lift_data = [{'elevator': config['elevator'], 
                          'serviced_floors': config['serviced_floors']} 
                         for config in serialized_configs]

            response = JsonResponse({'lifts': lift_data})

            # Add CORS headers
            response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

            return response
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)