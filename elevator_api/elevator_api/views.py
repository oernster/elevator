from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from .models import Elevator, ElevatorConfiguration
from .serializers import ElevatorSerializer, ElevatorConfigurationSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.views import View


class CustomResponse(Response):
    def __init__(self, data=None, status=None,
                 template_name=None, headers=None,
                 exception=False, content_type=None, *, lift_data=None):
        if lift_data is not None:
            data = {'lifts': lift_data}
        super().__init__(data=data, status=status,
                         template_name=template_name, headers=headers,
                         exception=exception, content_type=content_type)

    @classmethod
    def success(cls, lift_data=None, status=200):
        return cls(lift_data=lift_data, status=status)

    @classmethod
    def error(cls, data=None, status=400):
        return cls(data=data, status=status)


class ElevatorRequestView(APIView):
    def post(self, request):
        # Handle elevator request here
        try:
            # Example logic to handle elevator request
            # Extract floor information from request data
            from_floor = request.data.get('from_floor')
            to_floor = request.data.get('to_floor')
            
            # Perform elevator request logic here
            
            return CustomResponse.success(data={'message': 'Elevator requested successfully'})
        except Exception as e:
            return CustomResponse.error(data={'error': str(e)}, status=500)


class ElevatorStatusView(generics.ListAPIView):
    queryset = Elevator.objects.all()
    serializer_class = ElevatorSerializer


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
