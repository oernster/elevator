# Generated by Django 5.0.4 on 2024-04-15 18:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('elevator_api', '0002_alter_elevator_floor'),
    ]

    operations = [
        migrations.AddField(
            model_name='elevator',
            name='requested_destinations',
            field=models.JSONField(default=list),
        ),
    ]
