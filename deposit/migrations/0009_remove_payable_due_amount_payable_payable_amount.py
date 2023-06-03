# Generated by Django 4.2 on 2023-05-20 09:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deposit', '0008_payable'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='payable',
            name='due_amount',
        ),
        migrations.AddField(
            model_name='payable',
            name='payable_amount',
            field=models.DecimalField(decimal_places=4, default=0, max_digits=11),
            preserve_default=False,
        ),
    ]
