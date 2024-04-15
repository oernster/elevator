from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from .models import Elevator, ElevatorConfiguration
from .serializers import ElevatorSerializer, ElevatorConfigurationSerializer


class ElevatorRequestView(generics.CreateAPIView):
    queryset = Elevator.objects.all()
    serializer_class = ElevatorSerializer


class ElevatorStatusView(generics.ListAPIView):
    queryset = Elevator.objects.all()
    serializer_class = ElevatorSerializer


class ElevatorConfigView(APIView):
    def get(self, request):
        elevator_configs = ElevatorConfiguration.objects.all()
        print(elevator_configs)
        serializer = ElevatorConfigurationSerializer(elevator_configs, many=True)
        print(serializer.data)
        return Response({"lifts": serializer.data})
