# Generated by Django 4.2 on 2023-05-05 09:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loan', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='loan',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]